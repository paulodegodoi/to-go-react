import styles from "../styles/ModalSuccess.module.scss"

interface IModalSuccessProps {
  closeModalSuccess: () => void
}

export function ModalSuccess({ closeModalSuccess }: IModalSuccessProps) {
  return (
    <div className={styles.container}>
      <h3>Dados enviados com sucesso!</h3>
      <button onClick={closeModalSuccess}>OK</button>
    </div>
  )
}