import type { BlockDefinition } from "../types";
import { QuestionBankCreatorNode } from "./extension";

export const questionBankCreatorBlock: BlockDefinition = {
  type: "question_bank_creator",
  extension: QuestionBankCreatorNode,
  // We explicitly omit the command field here because this block 
  // is only supposed to be used in the Question Bank editor
  // and we don't want it appearing in the global slash menu.
};
