export type NavigatorResource = {
  id: string;
  name: string;
  description: string;
};

export type NavigatorSearchResult = {
  resources: NavigatorResource[];
};

export type NavigatorAnswer = {
  response: string;
};
