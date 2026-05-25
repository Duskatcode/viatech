export function isBlank(value: unknown) {
  return typeof value !== 'string' || value.trim().length === 0;
}

export function minLength(value: string, length: number) {
  return value.trim().length >= length;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function fileSizeInMb(file: File) {
  return file.size / (1024 * 1024);
}

export function validateFileSize(file: File, maxMb: number) {
  return fileSizeInMb(file) <= maxMb;
}
