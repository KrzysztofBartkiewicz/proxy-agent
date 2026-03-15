import { check_package, redirect_package } from './packagesApi.js'
import {
  CheckPackageParams,
  RedirectPackageParams
} from './toolDefinitions.js'

export const tools = {
  check_package: async (args: CheckPackageParams) => {
    return check_package(args.packageid)
  },

  redirect_package: async (args: RedirectPackageParams) => {
    return redirect_package(args.packageid, args.destination, args.code)
  }
}
