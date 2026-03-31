const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const toCsv = (rows, headers) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const safeHeaders = Array.isArray(headers) ? headers : [];

  const headerLine = safeHeaders.join(",");
  const lines = safeRows.map((row) =>
    safeHeaders.map((header) => escapeCsvValue(row?.[header])).join(",")
  );
  return [headerLine, ...lines].join("\n");
};

module.exports = { toCsv };
