import "server-only";
import { getItemBank, getModelVersion, getDeeperModelVersion } from "./client-content";

// Static imports keep private project files out of the function trace. Parse once per instance.
const bank = getItemBank();
const core = getModelVersion();
const deeper = getDeeperModelVersion();
export const loadItemBank = () => bank;
export const loadModelVersion = () => core;
export const loadDeeperModelVersion = () => deeper;
