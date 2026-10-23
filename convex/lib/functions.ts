import {
  internalMutationGeneric,
  mutationGeneric,
  type DataModelFromSchemaDefinition,
  type MutationBuilder,
} from "convex/server";
import type schema from "../schema";

// Bind public builders directly to the schema so backend code can be checked offline.
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export const mutation: MutationBuilder<DataModel, "public"> = mutationGeneric;
export const internalMutation: MutationBuilder<DataModel, "internal"> =
  internalMutationGeneric;
