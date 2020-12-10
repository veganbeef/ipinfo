export enum Service {
  ipapi = 'IPAPI',
  rdap = 'RDAP',
  ping = 'Ping',
  virusTotal = 'VirusTotal'
}

export type GetIPInfoQueryArgs = {
  domain: string;
  services: Service[];
};

export type ServiceResponse = {
  service: Service;
  data?: any;
  error?: any;
};