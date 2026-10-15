/** The shape another language must match: the same keys and list lengths, any wording. */
export type Shape<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? { readonly [I in keyof T]: Shape<T[I]> }
    : { readonly [K in keyof T]: Shape<T[K]> };

/** Dotted keys of the plain-text entries, like "today.checkinTitle". */
export type TextKey<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends readonly unknown[]
      ? never
      : TextKey<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Dotted keys of the list entries, like "checkin.moods". */
export type ListKey<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends readonly unknown[]
      ? `${P}${K}`
      : ListKey<T[K], `${P}${K}.`>;
}[keyof T & string];

export type PathValue<T, P extends string> = P extends `${infer H}.${infer R}`
  ? H extends keyof T
    ? PathValue<T[H], R>
    : never
  : P extends keyof T
    ? T[P]
    : never;
