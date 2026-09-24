const asyncHandler = require('../middleware/asyncHandler');
const noteService = require('../services/noteService');
const { successResponse } = require('../utils/apiResponse');

exports.getNotes = asyncHandler(async (req, res) => {
  const result = await noteService.getUserNotes(req.user._id, req.query);
  return successResponse(res, 'Notes fetched', { notes: result.notes, folders: result.folders }, 200, result.pagination);
});

exports.getNote = asyncHandler(async (req, res) => {
  const note = await noteService.getNoteById(req.user._id, req.params.id);
  return successResponse(res, 'Note details fetched', { note });
});

exports.createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.user._id, req.body);
  return successResponse(res, 'Note created successfully', { note }, 201);
});

exports.updateNote = asyncHandler(async (req, res) => {
  const note = await noteService.updateNote(req.user._id, req.params.id, req.body);
  return successResponse(res, 'Note updated successfully', { note });
});

exports.deleteNote = asyncHandler(async (req, res) => {
  const result = await noteService.deleteNote(req.user._id, req.params.id);
  return successResponse(res, result.message);
});
