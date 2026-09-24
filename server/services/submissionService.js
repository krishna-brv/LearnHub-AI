const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const LearningActivity = require('../models/LearningActivity');
const XPTransaction = require('../models/XPTransaction');
const AppError = require('../utils/AppError');
const cloudinary = require('../config/cloudinary');

class SubmissionService {
  /**
   * Submit Assignment (Student)
   */
  async submitAssignment(studentId, assignmentId, data, files = []) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || !assignment.isPublished) {
      throw new AppError('Assignment not found or not published.', 404);
    }

    // Check enrollment
    const isEnrolled = await Enrollment.exists({
      student: studentId,
      course: assignment.course,
      status: { $in: ['active', 'completed'] }
    });

    if (!isEnrolled) {
      throw new AppError('You must be enrolled in the course to submit this assignment.', 403);
    }

    // Check deadline
    const now = new Date();
    const isLate = now > new Date(assignment.deadline);

    if (isLate && !assignment.allowLateSubmission) {
      throw new AppError('The deadline for this assignment has passed, and late submissions are not allowed.', 400);
    }

    const lateDays = isLate ? Math.ceil((now.getTime() - new Date(assignment.deadline).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Process Cloudinary file uploads if any
    const uploadedFiles = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'learnhub-ai/assignments',
              resource_type: 'auto'
            },
            (err, res) => (err ? reject(err) : resolve(res))
          );
          uploadStream.end(file.buffer);
        });

        uploadedFiles.push({
          filename: file.originalname,
          url: result.secure_url,
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date()
        });
      }
    }

    // Check existing submission for resubmission
    let submission = await Submission.findOne({ assignment: assignmentId, student: studentId });

    if (submission) {
      // Archive previous attempt
      submission.previousSubmissions.push({
        files: submission.files,
        githubUrl: submission.githubUrl,
        demoUrl: submission.demoUrl,
        comments: submission.comments,
        submittedAt: submission.submittedAt
      });

      submission.files = uploadedFiles.length > 0 ? uploadedFiles : submission.files;
      submission.githubUrl = data.githubUrl || submission.githubUrl;
      submission.demoUrl = data.demoUrl || submission.demoUrl;
      submission.comments = data.comments || submission.comments;
      submission.submittedAt = now;
      submission.isLate = isLate;
      submission.lateDays = lateDays;
      submission.status = 'submitted';
      submission.resubmissionCount += 1;

      await submission.save();
    } else {
      submission = await Submission.create({
        assignment: assignmentId,
        student: studentId,
        course: assignment.course,
        files: uploadedFiles,
        githubUrl: data.githubUrl || '',
        demoUrl: data.demoUrl || '',
        comments: data.comments || '',
        submittedAt: now,
        isLate,
        lateDays,
        status: 'submitted'
      });

      await Assignment.findByIdAndUpdate(assignmentId, { $inc: { submissionCount: 1 } });
    }

    // Log Activity
    await LearningActivity.create({
      student: studentId,
      course: assignment.course,
      type: 'assignment_submit',
      metadata: { assignmentId, isLate },
      date: now
    });

    return { message: 'Assignment submitted successfully!', submission };
  }

  /**
   * Grade Submission (Instructor / Mentor)
   */
  async gradeSubmission(submissionId, graderId, gradeData) {
    const submission = await Submission.findById(submissionId).populate('assignment');
    if (!submission) {
      throw new AppError('Submission not found.', 404);
    }

    const { grade, feedback, rubricScores } = gradeData;
    const maxMarks = submission.assignment.maxMarks;

    if (grade < 0 || grade > maxMarks) {
      throw new AppError(`Grade must be between 0 and maximum marks (${maxMarks}).`, 400);
    }

    // Apply late penalty if applicable
    let finalGrade = grade;
    if (submission.isLate && submission.assignment.latePenaltyPercent > 0) {
      const penalty = (maxMarks * (submission.assignment.latePenaltyPercent / 100)) * submission.lateDays;
      finalGrade = Math.max(0, grade - penalty);
    }

    const percentage = Math.round((finalGrade / maxMarks) * 100);

    submission.grade = finalGrade;
    submission.percentage = percentage;
    submission.feedback = feedback || '';
    submission.rubricScores = rubricScores || [];
    submission.gradedBy = graderId;
    submission.gradedAt = new Date();
    submission.status = 'graded';

    await submission.save();

    // Recalculate Student Progress assignment average
    const gradedSubmissions = await Submission.find({
      student: submission.student,
      course: submission.course,
      status: 'graded'
    });

    const assignAvg = Math.round(gradedSubmissions.reduce((acc, s) => acc + s.percentage, 0) / (gradedSubmissions.length || 1));

    let progress = await Progress.findOne({ student: submission.student, course: submission.course });
    if (progress) {
      progress.assignmentAverage = assignAvg;
      progress.totalAssignmentsSubmitted = gradedSubmissions.length;
      progress.masteryScore = Math.round(
        progress.overallProgress * 0.4 + progress.quizAverage * 0.3 + assignAvg * 0.3
      );
      await progress.save();
    }

    // Award XP
    const xpAmount = percentage >= 90 ? 80 : 40;
    try {
      await XPTransaction.addXP(
        submission.student,
        xpAmount,
        percentage >= 90 ? 'assignment_excellent' : 'assignment_submit',
        `Completed assignment: ${submission.assignment.title}`,
        submission._id,
        'Submission',
        `Graded assignment score (${percentage}%)`
      );
    } catch (xpErr) {
      console.warn('⚠️ Could not award assignment XP:', xpErr.message);
    }

    return { message: 'Submission graded successfully!', submission };
  }

  /**
   * Get Submissions for an Assignment (Instructor / Mentor)
   */
  async getAssignmentSubmissions(assignmentId) {
    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName email username profile.avatar')
      .populate('gradedBy', 'firstName lastName')
      .sort({ submittedAt: -1 });

    return submissions;
  }

  /**
   * Get Student's Own Submissions
   */
  async getStudentSubmissions(studentId, courseId) {
    const filter = { student: studentId };
    if (courseId) filter.course = courseId;

    const submissions = await Submission.find(filter)
      .populate('assignment', 'title deadline maxMarks')
      .sort({ submittedAt: -1 });

    return submissions;
  }
}

module.exports = new SubmissionService();
