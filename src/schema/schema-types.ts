export enum Service {
  ipapi = 'IPAPI',
  rdap = 'RDAP',
  ping = 'Ping',
  virusTotal = 'VirusTotal'
}

export type GetIPInfoQueryArgs = {
  domain: string;
  services: Array<Service>;
};

export type ServiceResponse = {
  service: Service;
  data?: any;
  error?: any;
};