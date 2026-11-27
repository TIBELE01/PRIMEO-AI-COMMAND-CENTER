// @primeo/integrations/supabase — accès à Supabase partagé par l'API, les workers et le frontend.
export type { Database, Enums, Json, Tables, TablesInsert, TablesUpdate } from "./database.types";
export { Constants } from "./database.types";
export { createServiceClient, createUserClient, type TypedSupabaseClient } from "./clients";
export { DatabaseError, NotFoundError } from "./errors";
export { unwrap, unwrapOne } from "./query";
