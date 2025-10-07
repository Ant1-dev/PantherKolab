import React from "react";
import { axiosPrivate } from "../lib/axios";

//models
import { Context, User } from "../models";
import useAppContext from "./useAppContext";
import { UserContext } from "../contexts";

function useSearch(username: string) {
  const [searchResults, setSearchResults] = React.useState<User[]>([]);
  const [currentUser] = useAppContext(UserContext) as Context<User>;

  React.useEffect(() => {
    if (username)
      axiosPrivate
        .get(`/search/users/?user=${username.toLowerCase()}`)
        .then(({ data }) => setSearchResults(data));
  }, [username]);
  return searchResults.filter((item) => item.id !== currentUser?.id);
}

export default useSearch;
