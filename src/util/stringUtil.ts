export const 包含中文 = function (str: string) {
  return /[\u4e00-\u9fa5\u3007]/.test(str);
};

export const 是纯字母 = function (str: string) {
  return /[A-Za-z]/.test(str);
};

export const 是数字 = function (str: string) {
  return /[0-9]/.test(str);
};
