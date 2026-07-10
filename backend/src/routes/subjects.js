const express = require('express');
const subjectController = require('../controllers/subjectController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  createSubjectRules,
  updateSubjectRules,
} = require('../validators/subjectValidators');

const router = express.Router();

// Require session verification on all subject endpoints
router.use(authenticate);

router.post('/', createSubjectRules, validate, subjectController.createSubject);
router.get('/', subjectController.getAllSubjects);

router.get('/:subjectId', subjectController.getSubjectById);
router.patch('/:subjectId', updateSubjectRules, validate, subjectController.updateSubject);
router.delete('/:subjectId', subjectController.deleteSubject);

router.patch('/:subjectId/archive', subjectController.toggleArchive);
router.post('/:subjectId/quick-mark', subjectController.quickMark);

module.exports = router;
