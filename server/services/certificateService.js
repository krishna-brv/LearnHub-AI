const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');
const { generateQRCode, generateCertificateUUID, buildVerificationUrl } = require('../utils/certificateGenerator');

class CertificateService {
  /**
   * Generate Certificate upon Course Completion
   */
  async generateCertificate(studentId, courseId) {
    // Verify course completion
    const progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress || progress.overallProgress < 100) {
      throw new AppError('You must complete 100% of the course lessons to generate a certificate.', 400);
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({ student: studentId, course: courseId });
    if (certificate) {
      return certificate;
    }

    const [student, course, enrollment] = await Promise.all([
      User.findById(studentId),
      Course.findById(courseId).populate('instructor', 'firstName lastName'),
      Enrollment.findOne({ student: studentId, course: courseId })
    ]);

    if (!student || !course || !enrollment) {
      throw new AppError('Student or course details not found.', 404);
    }

    const certificateId = generateCertificateUUID();
    const verificationUrl = buildVerificationUrl(certificateId);
    const qrCode = await generateQRCode(verificationUrl);

    let grade = 'pass';
    if (progress.masteryScore >= 90) grade = 'distinction';
    else if (progress.masteryScore >= 75) grade = 'merit';

    certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      enrollment: enrollment._id,
      certificateId,
      studentName: `${student.firstName} ${student.lastName}`,
      courseName: course.title,
      instructorName: `${course.instructor.firstName} ${course.instructor.lastName}`,
      completionDate: new Date(),
      verificationUrl,
      qrCode,
      grade,
      masteryScore: progress.masteryScore,
      isValid: true
    });

    return certificate;
  }

  /**
   * Verify Certificate Publicly by Certificate ID
   */
  async verifyCertificate(certificateId) {
    const certificate = await Certificate.findOne({ certificateId, isValid: true })
      .populate('student', 'firstName lastName profile.avatar')
      .populate('course', 'title thumbnail category');

    if (!certificate) {
      throw new AppError('Invalid, revoked, or non-existent certificate ID.', 404);
    }

    return certificate;
  }

  /**
   * Get All Certificates for Student
   */
  async getStudentCertificates(studentId) {
    const certificates = await Certificate.find({ student: studentId, isValid: true })
      .populate('course', 'title thumbnail category')
      .sort({ completionDate: -1 });

    return certificates;
  }
}

module.exports = new CertificateService();
