const subjectService = require('../services/subjectService');
const SubjectDto = require('../dtos/subject.dto');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const MESSAGES = require('../constants/messages');
const asyncWrapper = require('../utils/asyncWrapper');

const createSubject = asyncWrapper(async (req, res) => {
  const subject = await subjectService.createSubject(req.user._id, req.body);
  
  return ApiResponse.success(
    res,
    HTTP.CREATED,
    MESSAGES.SUBJECT.CREATE_SUCCESS,
    SubjectDto.toPublicSubject(subject)
  );
});

const getAllSubjects = asyncWrapper(async (req, res) => {
  const { includeArchived, sort } = req.query;
  
  const subjects = await subjectService.getAllSubjects(req.user._id, {
    includeArchived: includeArchived === 'true',
    sort,
  });

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Subjects fetched successfully',
    SubjectDto.toPublicSubjectList(subjects)
  );
});

const getSubjectById = asyncWrapper(async (req, res) => {
  const { subjectId } = req.params;
  
  const subject = await subjectService.getSubjectById(req.user._id, subjectId);

  return ApiResponse.success(
    res,
    HTTP.OK,
    'Subject details fetched successfully',
    SubjectDto.toPublicSubject(subject)
  );
});

const updateSubject = asyncWrapper(async (req, res) => {
  const { subjectId } = req.params;
  
  const subject = await subjectService.updateSubject(req.user._id, subjectId, req.body);

  return ApiResponse.success(
    res,
    HTTP.OK,
    MESSAGES.SUBJECT.UPDATE_SUCCESS,
    SubjectDto.toPublicSubject(subject)
  );
});

const deleteSubject = asyncWrapper(async (req, res) => {
  const { subjectId } = req.params;

  await subjectService.deleteSubject(req.user._id, subjectId);

  return ApiResponse.success(res, HTTP.OK, MESSAGES.SUBJECT.DELETE_SUCCESS);
});

const toggleArchive = asyncWrapper(async (req, res) => {
  const { subjectId } = req.params;

  const subject = await subjectService.toggleArchive(req.user._id, subjectId);

  const message = subject.isArchived
    ? MESSAGES.SUBJECT.ARCHIVED
    : MESSAGES.SUBJECT.RESTORED;

  return ApiResponse.success(
    res,
    HTTP.OK,
    message,
    SubjectDto.toPublicSubject(subject)
  );
});

const quickMark = asyncWrapper(async (req, res) => {
  const { subjectId } = req.params;
  const { attended } = req.body; // boolean: true = present, false = absent

  const subject = await subjectService.quickMark(req.user._id, subjectId, attended);

  return ApiResponse.success(
    res,
    HTTP.OK,
    attended ? 'Class marked as attended!' : 'Class marked as missed.',
    SubjectDto.toPublicSubject(subject)
  );
});

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  toggleArchive,
  quickMark,
};
