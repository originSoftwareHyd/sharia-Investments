import { PostForm } from './PostForm'

/**
 * Keeps page orchestration separate from field-level form and preview presentation.
 */
export function PostEditor(props) {
  return <PostForm {...props} />
}
