// src/configs/chartConfigs.js
// 图表统一管理
import api from "@/api/Statistic.js";

export const chartConfigs = {
  /** 📊 交易表现类（交易胜率、盈亏情况） **/
  tradingPerformance: {
    title: "交易表现",
    apis: [
      api.getWindRate, // 胜率
      api.getYingKui1, // 盈亏比1
      api.getYingKui2, // 盈亏比2
      api.getMaxProfitByTrade, // 单笔最大盈利和亏损
      api.getDailyMaxProfitAndDrawdown // 单日最大盈利及回撤（5条线）
    ],
    xAxisType: "category",
    yAxis: [
      { name: "胜率/盈亏值", type: "value", min: 0, max: 100 },
      { name: "盈亏比", type: "value", min: 0 }
    ],
    legend: [
      "胜率(%)",
      "盈亏比",
      "盈",
      "亏",
      "最大单笔盈利",
      "最大单笔亏损",
      "最大日盈利",
      "最大日亏损",
      "最大回撤"
    ],
    seriesSetup: dataList => {
      // dataList是依次是5组数据
      return [];
    }
  },

  /** 💰 资金情况类（资金规模、期初、盈亏） **/
  fundSituation: {
    title: "资金情况",
    apis: [
      api.getInitialProfitAndLoss, // 期初盈亏
      api.getRangeProfit // 区间盈亏
    ],
    xAxisType: "category",
    yAxis: [{ name: "金额", type: "value" }],
    legend: ["期初盈亏", "区间盈亏"],
    seriesSetup: dataList => {
      return [];
    }
  },

  /** 📈 收益表现类（收益率） **/
  earningPerformance: {
    title: "收益表现",
    apis: [
      api.getRangeEarningRate, // 区间收益率
      api.getYearEarningRate // 年化收益率
    ],
    xAxisType: "category",
    yAxis: [{ name: "收益率(%)", type: "value", min: 0, max: 100 }],
    legend: ["区间收益率(%)", "年化收益率(%)"],
    seriesSetup: dataList => {
      return [];
    }
  }
};
