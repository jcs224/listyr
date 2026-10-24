export default async function () {
  await authClient.signOut()
  await navigateTo('/login')
}
