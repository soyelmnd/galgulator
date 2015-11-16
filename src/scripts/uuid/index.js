/**
 * @name uuid
 * @function
 * @return {string} uuid
 * @description
 * A fake uuid which does look pretty cool
 *   with the format xxxx-xxxx-xxxx-xxxx
 */
export default function() {
  return (
    new Date().getTime().toString(36)
    + Math.random().toString(36).slice(-8)
  )
  .match(/.{1,4}/gi)
  .join('-');
}
