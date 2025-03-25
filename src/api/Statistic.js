// 用户
import request from "@/utils/request";
import Vue from "vue";

export default {
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

  getChannels() {
    return request({
      url: `${Vue.prototype.$apiUrl}/channel`,
      method: "get",
    });
  },
};

// **关键修正点**
// 1. 移除了 **多余空行**
// 2. 修复了 **行尾多余空格**
// 3. **确保文件末尾有一行空行**
