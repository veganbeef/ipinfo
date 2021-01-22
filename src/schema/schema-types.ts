/**
 * Enum of all services available to query
 */
export enum Service {
  ipapi = 'IPAPI',
  rdap = 'RDAP',
  ping = 'Ping',
  virusTotal = 'VirusTotal'
}

/**
 * Input type for getIPInfo GraphQL query
 */
export type GetIPInfoQueryArgs = {
  domain: string;
  services: Service[];
};

/**
 * Response type for getIPInfo GraphQL query
 */
export type ServiceResponse = {
  service: Service;
  data?: any;
  error?: any;
};