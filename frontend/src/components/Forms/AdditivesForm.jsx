import OperationForm from './OperationForm'

// Thin wrapper preserved so existing imports keep working.
// Renders OperationForm in additive mode.
export default function AdditivesForm(props) {
  return <OperationForm category="additive" {...props} />
}
