// 用户
import request from "@/utils/request";
import Vue from "vue";

export default {
  getChannels() {
    return request({
      url: `${Vue.prototype.$apiUrl}/channel`,
      method: "get",
    });
  },
  // 获取胜率
  getWindRate(params) {
    return request({
      url: `${Vue.prototype.$apiUrl}/statistic/shenglv`,
      method: "post",
      data: {
        startDate: params.startDate,
        endDate: params.endDate,
        userIds: params.userIds,
        channelIds: params.channelIds,
        weidu: params.weidu,
      },
    });
  },

  // 获取盈亏比1
  getYingKui1(params) {
    return request({
      url: `${Vue.prototype.$apiUrl}/statistic/yingkuibi1`,
      method: "post",
      data: {
        startDate: params.startDate,
        endDate: params.endDate,
        userIds: params.userIds,
        channelIds: params.channelIds,
        weidu: params.weidu,
      },
    });
  },

  // 获取盈亏比2
  getYingKui2(params) {
    return request({
      url: `${Vue.prototype.$apiUrl}/statistic/yingkuibi2`,
      method: "post",
      data: {
        startDate: params.startDate,
        endDate: params.endDate,
        userIds: params.userIds,
        channelIds: params.channelIds,
        weidu: params.weidu,
      },
    });
  },

    // 获取"期初盈亏"
    getInitialProfitAndLoss(params) {
      return request({
        url: `${Vue.prototype.$apiUrl}/statistic/initialProfit`,
        method: "post",
        data: {
          startDate: params.startDate,
          endDate: params.endDate,
          userIds: params.userIds,
          channelIds: params.channelIds,
          weidu: params.weidu,
        },
      });
    },

     // 获取"单日最大盈利及回撤"
     getDailyMaxProfitAndDrawdown(params) {
      return request({
        url: `${Vue.prototype.$apiUrl}/statistic/maxprofitbydate`,
        method: "post",
        data: {
          startDate: params.startDate,
          endDate: params.endDate,
          userIds: params.userIds,
          channelIds: params.channelIds,
          weidu: params.weidu,
        },
      });
    },

      // 获取"单笔最大盈利和亏损"
      getMaxProfitByTrade(params) {
        return request({
          url: `${Vue.prototype.$apiUrl}/statistic/maxprofitbytrade`,
          method: "post",
          data: {
            startDate: params.startDate,
            endDate: params.endDate,
            userIds: params.userIds,
            channelIds: params.channelIds,
            weidu: params.weidu,
          },
        });
      },

      // 获取"区间收益率"
      getRangeEarningRate(params) {
        return request({
          url: `${Vue.prototype.$apiUrl}/statistic/rangeEarningRate`,
          method: "post",
          data: {
            startDate: params.startDate,
            endDate: params.endDate,
            userIds: params.userIds,
            channelIds: params.channelIds,
            weidu: params.weidu,
          },
        });
      },

      // 获取"区间盈亏"
      getRangeProfit(params) {
        return request({
          url: `${Vue.prototype.$apiUrl}/statistic/rangeProfit`,
          method: "post",
          data: {
            startDate: params.startDate,
            endDate: params.endDate,
            userIds: params.userIds,
            channelIds: params.channelIds,
            weidu: params.weidu,
          },
        });
      },

      // 获取"年化收益率"
      getYearEarningRate(params) {
        return request({
          url: `${Vue.prototype.$apiUrl}/statistic/yearEarningRate`,
          method: "post",
          data: {
            startDate: params.startDate,
            endDate: params.endDate,
            userIds: params.userIds,
            channelIds: params.channelIds,
            weidu: params.weidu,
          },
        });
      }
};

// **关键修正点**
// 1. 移除了 **多余空行**
// 2. 修复了 **行尾多余空格**
// 3. **确保文件末尾有一行空行**
