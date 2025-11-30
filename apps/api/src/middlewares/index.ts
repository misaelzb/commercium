import type { Store, User } from "@commercium/core";

export type AuthContext = {
    Variables: {
        currentUser: User.InfoType;
    };
};

export type StoreContext = {
    Variables: {
        store: Store.StoreType;
        currentUser: User.InfoType;
    };
}
export { authMiddleware } from "./auth"