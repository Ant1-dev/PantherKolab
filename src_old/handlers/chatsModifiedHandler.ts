export default function chatsModifiedHandler(revalidate: Function) {
  return () => revalidate();
}
