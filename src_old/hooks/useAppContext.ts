import React from "react";

//ensure that the context is being used inside it's provider
export default function useAppContext<T = any>(context: React.Context<T>): T {
  const value = React.useContext(context);

  if (!value) {
    process.env.NODE_ENV !== "production" && console.log(context);
    throw new Error(
      `You are trying to access a context outside of its scope or the context is undefined`
    );
  }

  return value;
}
