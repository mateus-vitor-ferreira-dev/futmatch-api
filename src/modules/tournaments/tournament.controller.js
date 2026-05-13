import { asyncHandler } from "../../utils/asyncHandler.js";
import { success, created } from "../../utils/apiResponse.js";
import * as tournamentService from "./tournament.service.js";

// Tournaments

export const list = asyncHandler(async (req, res) => {
    const tournaments = await tournamentService.listTournaments(req.validatedQuery ?? {});
    return success(res, tournaments);
});

export const getOne = asyncHandler(async (req, res) => {
    const tournament = await tournamentService.getTournament(req.params.tournamentId);
    return success(res, tournament);
});

export const create = asyncHandler(async (req, res) => {
    const tournament = await tournamentService.createTournament(req.body, req.user.sub);
    return created(res, tournament);
});

export const update = asyncHandler(async (req, res) => {
    const tournament = await tournamentService.updateTournament(req.tournament, req.body);
    return success(res, tournament);
});

export const updateStatus = asyncHandler(async (req, res) => {
    const tournament = await tournamentService.updateTournamentStatus(req.tournament, req.body.status);
    return success(res, tournament);
});

export const remove = asyncHandler(async (req, res) => {
    const deleted = await tournamentService.deleteTournament(req.tournament);
    return success(res, deleted);
});

// Divisions

export const listDivisions = asyncHandler(async (req, res) => {
    const divisions = await tournamentService.listDivisions(req.params.tournamentId);
    return success(res, divisions);
});

export const getOneDivision = asyncHandler(async (req, res) => {
    const division = await tournamentService.getDivision(req.params.divisionId, req.params.tournamentId);
    return success(res, division);
});

export const createDivision = asyncHandler(async (req, res) => {
    const division = await tournamentService.createDivision(req.params.tournamentId, req.body);
    return created(res, division);
});

export const updateDivision = asyncHandler(async (req, res) => {
    const division = await tournamentService.getDivision(req.params.divisionId, req.params.tournamentId);
    const updated = await tournamentService.updateDivision(division, req.body);
    return success(res, updated);
});

export const removeDivision = asyncHandler(async (req, res) => {
    const division = await tournamentService.getDivision(req.params.divisionId, req.params.tournamentId);
    const deleted = await tournamentService.deleteDivision(division);
    return success(res, deleted);
});
