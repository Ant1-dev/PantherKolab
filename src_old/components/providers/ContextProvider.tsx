import React from "react";

export default function ContextProvider({ context, ...props }: any) {
  const value = React.useState(null);

  return <context.Provider value={value} {...props} />;
}
