import type { Store, User } from "@commercium/core";

export interface AuthContext {
  Variables: {
    currentUser: User.InfoType;
    sessionToken: string;
  };
}

export interface StoreContext {
  Variables: AuthContext["Variables"] & {
    store: Store.StoreType;
  };
}
export { authMiddleware } from "./auth";
