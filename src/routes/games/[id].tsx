import { useParams } from "@solidjs/router"
import { Board } from "~/components/Board"

function GameRoute() {
  const params = useParams()

  return (
    <div>
      <Board gameId={params.id} />
    </div>
  )
}

export default GameRoute
