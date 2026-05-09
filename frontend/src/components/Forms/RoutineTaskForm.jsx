import OperationForm from './OperationForm'

// Thin wrapper that opens OperationForm in routine-task mode.
export default function RoutineTaskForm(props) {
  return <OperationForm category="routine_task" {...props} />
}
