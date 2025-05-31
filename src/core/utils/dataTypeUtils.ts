/**
 * Infers the potential data type of a given string value.
 * @param value The string value to inspect.
 * @returns A string indicating the inferred type ('date', 'numeric', 'location', 'text').
 */
export function inferFieldType(value: string): 'date' | 'numeric' | 'location' | 'text' {
  if (typeof value !== 'string') {
    // If the value isn't a string, it's hard to infer for typical field inputs.
    // Depending on stricter type handling, you might return 'text' or handle as an error.
    return 'text';
  }
  if (!isNaN(Date.parse(value))) return 'date';
  // Ensure that the value is not empty and is a valid number representation
  if (value.trim() !== '' && !isNaN(Number(value))) return 'numeric';
  // Regex for basic lat,lon format.
  if (
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(
      value
    )
  ) {
    return 'location';
  }
  return 'text';
}
