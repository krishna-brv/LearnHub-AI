const Skill = require('../models/Skill');
const StudentSkill = require('../models/StudentSkill');
const AppError = require('../utils/AppError');

class SkillService {
  /**
   * Get Visual Skill Tree with Student Mastery Status
   */
  async getSkillTree(studentId) {
    const [allSkills, studentSkills] = await Promise.all([
      Skill.find({ isActive: true }).sort({ category: 1, level: 1, order: 1 }),
      studentId ? StudentSkill.find({ student: studentId }) : []
    ]);

    const studentSkillMap = new Map(studentSkills.map((ss) => [ss.skill.toString(), ss]));

    // Attach student mastery status to skill tree nodes
    const skillsWithStatus = allSkills.map((skill) => {
      const sObj = skill.toObject();
      const userProgress = studentSkillMap.get(skill._id.toString());

      sObj.status = userProgress ? userProgress.status : 'locked';
      sObj.masteryLevel = userProgress ? userProgress.masteryLevel : 0;
      sObj.xpEarned = userProgress ? userProgress.xpEarned : 0;

      return sObj;
    });

    // Build hierarchical tree by parent
    const roots = skillsWithStatus.filter((s) => !s.parent);
    const tree = roots.map((root) => {
      root.children = skillsWithStatus.filter((s) => s.parent && s.parent.toString() === root._id.toString());
      return root;
    });

    return {
      totalSkills: allSkills.length,
      masteredCount: studentSkills.filter((ss) => ss.status === 'mastered').length,
      learningCount: studentSkills.filter((ss) => ss.status === 'learning').length,
      tree
    };
  }

  /**
   * Update Student Skill Mastery
   */
  async updateStudentSkill(studentId, skillId, masteryLevel) {
    let studentSkill = await StudentSkill.findOne({ student: studentId, skill: skillId });

    const status = masteryLevel >= 80 ? 'mastered' : masteryLevel > 0 ? 'learning' : 'locked';

    if (studentSkill) {
      studentSkill.masteryLevel = masteryLevel;
      studentSkill.status = status;
      studentSkill.lastAssessedAt = new Date();
      if (status === 'mastered' && !studentSkill.masteredAt) {
        studentSkill.masteredAt = new Date();
      }
      await studentSkill.save();
    } else {
      studentSkill = await StudentSkill.create({
        student: studentId,
        skill: skillId,
        status,
        masteryLevel,
        unlockedAt: new Date(),
        masteredAt: status === 'mastered' ? new Date() : null
      });
    }

    return studentSkill;
  }
}

module.exports = new SkillService();
