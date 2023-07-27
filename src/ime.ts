import { 是数字 } from "./util/stringUtil";
import * as sqlite3 from "sqlite3";

/**
 * 从数据库获取对应拼音的查询结果
 * @param py 拼音字符串，无分隔符
 * @param length 文字长度
 * @returns 所有匹配结果
 */
const searchDB = (
  py: string,
  length: number
): Promise<{ pinyin: string; word: string }[]> => {
  return new Promise((resolve, reject) => {
    // console.log(__dirname + '/test.db');

    const db = new sqlite3.Database(__dirname + "/test.db");
    db.all(
      "select pinyin, word from word where pinyin like ? and word like ? order by count desc;",
      py,
      "_".repeat(length),
      (err: any, row: { pinyin: string; word: string }[]) => {
        if (err) {
          reject(err);
        }
        const res = Array.from(new Set(row));
        return resolve(res);
      }
    );
  });
};

/**
 * 将连起来的整串拼音切割成一个个拼音
 * @param py 拼音字符串，无分隔符
 * @returns 数组，分割出来的每个拼音为一个元素
 */
const splitPinyin = (py: string) => {
  const reg =
    /[^aoeiuv]?h?[iuv]?(ai|ei|ao|ou|er|ang?|eng?|ong|a|o|e|i|u|ng|n)?/g;
  const res = py.match(reg);
  if (!res) {
    return [];
  }
  res.pop();
  return res;
};

/**
 * 将只有声母的拼音加上通配符，便于在数据库中模糊查询
 * @param pys 拼音数组
 * @returns 加上通配符的数组
 */
const incompletePinyinProcess = (pys: string[]) => {
  for (let i = 0; i < pys.length; i++) {
    // 拼音只给了个声母的，给他补上通配符
    if (/^[^aoeiuv]?h?$/g.test(pys[i])) {
      pys[i] += "%";
    }
  }
  return pys;
};

/**
 * 由一串拼音得出所有候选词（包括独立的字）
 * @param py 拼音字符串
 * @returns 候选词列表
 */
const makeAllCandidates = async (py: string) => {
  if (py === "") {
    return [];
  }

  let splited = splitPinyin(py);
  splited = incompletePinyinProcess(splited);

  // 每次循环都踢出最后一个拼音，然后连成拼音串，在数据库查找匹配
  // ['zhong','wen','shu','ru'] -> ['zhong','wen','shu'] -> ['zhong','wen'] -> ['zhong']

  const allCandidates = [];
  for (let i = 0; i < splited.length; i++) {
    if (allCandidates.length >= 10) {
      break;
    }

    const subArray = splited.slice(0, splited.length - i);
    const subPinyinStr = subArray.join("");

    let searchResult = await searchDB(subPinyinStr, subArray.length);
    let subCandidates = Array.from(searchResult, (v) => {
      // 将未能匹配到的拼音串加入到对象中
      const suffix = splited
        .slice(splited.length - i)
        .map((v) => v.replace("%", ""))
        .join("");
      return { ...v, remain: suffix };
    });
    allCandidates.push(...subCandidates);
  }

  // 候选词的第一项应该尽可能地匹配完所有拼音
  // 下面将不断取候选词的第一项来匹配、拼接
  if (allCandidates.length > 0 && allCandidates[0].remain !== "") {
    let completeCandidate = { ...allCandidates[0] };
    // 取剩余未匹配部分来继续匹配
    const subCandidate = (await makeAllCandidates(completeCandidate.remain))[0];
    if (subCandidate) {
      completeCandidate.pinyin += subCandidate.pinyin;
      completeCandidate.remain = subCandidate.remain;
      completeCandidate.word += subCandidate.word;
      allCandidates.unshift(completeCandidate);
    }
  }
  return allCandidates;
};

/**
 * IME主入口
 * @param pyStr 拼音串，无分隔符
 * @param candidateAmount 候选词数量
 * @returns 候选词
 */
const imeMain = async (
  pyStr: string,
  candidateAmount: number = 5
): Promise<
  {
    remain: string;
    pinyin: string;
    word: string;
  }[]
> => {
  if (pyStr.indexOf("\r") !== -1 || pyStr.indexOf("\n") !== -1) {
    return [];
  }

  // 因为要处理输入数字来选择对应候选词的逻辑
  // 这里将首先找出第一个数字i出现的位置，将其左边的拼音拿去寻找候选词列表，取索引为i的候选词项
  // 然后，将该候选词未能匹配到的部分，与数字右边的字符串合并，递归地调用本函数
  // 最后，将递归调用的结果，对每个候选词加上当前所选择的部分，作为返回值返回。

  for (let i = 0; i < pyStr.length; i++) {
    if (是数字(pyStr[i])) {
      // 取数字左边的拼音串处理
      const subPinyinStr = pyStr.substring(0, i);
      const subStrCandidates = await makeAllCandidates(subPinyinStr);

      // 根据该数字选择对应候选词
      const choiceIdx = parseInt(pyStr[i]) - 1;
      if (choiceIdx >= subStrCandidates.length) {
        return [];
      }
      const choiceWord = subStrCandidates[choiceIdx].word;
      const choicePinyin = subStrCandidates[choiceIdx].pinyin;
      const choiceRemain = subStrCandidates[choiceIdx].remain;

      // 该候选词未能匹配到的部分，与数字右边的字符串合并
      const leftRemain = subPinyinStr.substr(
        subPinyinStr.length - choiceRemain.length
      );
      const rightRemain = pyStr.substring(i + 1);
      let result = (await imeMain(leftRemain + rightRemain)).map((v) => {
        v.pinyin = choicePinyin + v.pinyin;
        v.word = choiceWord + v.word;
        return v;
      });

      // 此处长度为0，说明已经匹配了所有拼音，因此只需将当前所选的包装一下返回
      if (result.length === 0) {
        result = [{ pinyin: choicePinyin, word: choiceWord, remain: "" }];
      }
      return result;
    }
  }

  // 此处即剩余字符串没有数字的情况，将查询结果直接返回即可
  const r = await makeAllCandidates(pyStr);
  return r.slice(0, candidateAmount);
};

export default imeMain;
