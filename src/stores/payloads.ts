/**
 * Payload shapes shared by several store actions
 * (the actions take a single object, a legacy of the Vuex mutations they come from)
 */
export interface ValuePayload<T> {
    value: T;
}

export interface RefPayload {
    ref: string;
}

export interface ContentPayload<T> {
    content: Partial<T>;
}
