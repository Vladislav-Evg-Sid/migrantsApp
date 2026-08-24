import { useParams } from "react-router-dom";

export default function ParticipantDetailsPage() {
  const { id } = useParams();
  return <>Детали пользователя {id}</>;
}
