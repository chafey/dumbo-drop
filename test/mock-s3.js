module.exports = () => {
  const putParams = []
  const getParams = []
  return {
    putParams,
    getParams,
    putObject: params => {
      putParams.push(params)
      return {
        promise: async () => { }
      }
    },
    getObject: params => {
      getParams.push(params)
      return {
        promise: async () => {
          return {
            Body: "mockGetObjectData"
          }
        }
      }
    }
  }
}
