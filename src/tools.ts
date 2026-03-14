import { check_package, redirect_package } from './packagesApi.js'

export const tools = {
  check_package: async (args: { packageid: string }) => {
    return check_package(args.packageid)
  },

  redirect_package: async (args: { packageid: string; destination: string; code: string }) => {
    return redirect_package(args.packageid, args.destination, args.code)
  }
}
