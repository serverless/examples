export interface IDummyObject {
  firstItem: string;
  secondItem: string;
}

export interface IDummyQueryArgs {
  itemId: string;
}

export interface IDummyMutationArgs {
  input: {
    firstInput: string;
    secondInput: string;
  };
}
