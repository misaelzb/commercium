import z from "zod";

export const dateValue = () =>
  z.codec(z.string(), z.date(), {
    encode: (date) => date.toString(),
    decode: (dateStr) => new Date(dateStr),
  });
