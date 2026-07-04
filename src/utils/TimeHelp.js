
export const now = new Date();

export const currentDateTime =
  `${now.getFullYear()}-${
    String(now.getMonth() + 1).padStart(2, "0")
  }-${
    String(now.getDate()).padStart(2, "0")
  } ${
    String(now.getHours()).padStart(2, "0")
  }:${
    String(now.getMinutes()).padStart(2, "0")
  }:${
    String(now.getSeconds()).padStart(2, "0")
  }`;

console.log(currentDateTime);
