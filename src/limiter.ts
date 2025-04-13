import Bottleneck from "bottleneck";


export const blingLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 350,
})