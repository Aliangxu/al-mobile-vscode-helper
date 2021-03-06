export interface IConfiguration {
  commands: ICommandConfiguration[];
  variables: IVariableConfiguration;
}

export interface ICommandConfiguration {
  identifier: string;
  description: string;
  module: string;
  command: string;
  working_directory: string;
  form?: IFormConfiguration[];
  show_in_console?: boolean;
}

export interface IFormConfiguration {
  variable: string;
  question: string;
  default?: string;
  password?: boolean;
  options?: string[];
}

export type IVariableConfiguration = { [id: string]: string };
