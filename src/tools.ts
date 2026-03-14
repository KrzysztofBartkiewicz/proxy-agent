export async function check_package(args: { id: string }) {
  return {
    status: 'in_transit',
    location: 'warehouse A'
  }
}

export async function redirect_package(args: { id: string; city: string }) {
  return {
    status: 'redirected',
    new_destination: args.city
  }
}

type ToolFunction = (args: any) => Promise<any>

export const tools: Record<string, ToolFunction> = {
  check_package,
  redirect_package
}
