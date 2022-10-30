import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import Select from "react-select"

import { api } from "../services/api"
import Logo from "../assets/logo.png"
import { ModalSuccess } from "./ModalSuccess"
import styles from "../styles/Form.module.scss"

interface IFormInputs {
  name: string
  email: string
  phone: number
  cpf: number
  countries: string[]
  cities: string[]
}

interface IApiData {
  name: string
  name_ptbr: string
}

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email("Insira um Email válido.").required(),
  phone: yup.number().typeError("Insira um Número válido com DD.")
                      .moreThan(9999999999, "Insira um Número válido com DD.")
                          .required(),
  cpf: yup.number().typeError("Insira um CPF válido (somente números).")
                    .moreThan(9999999999, "Insira um CPF válido (somente números).")
                      .lessThan(99999999999, "Insira um CPF válido (somente números).")
                        .required(),
}).required();

export function Form() {
  const [countries, setCountries] = useState<IApiData[]>([])
  const [cities, setCities] = useState<IApiData[]>([])
  const [selectedCountries, setSelectedCountries] = useState<any[]>([])
  const [selectedCities, setSelectedCities] = useState<any[]>([])
  const [showModalSuccess, setShowModalSuccess] = useState(false)

  // get countries api
  useEffect(() => {
    api.get("country").then(({ data }) => {
      setCountries(data)
    })  
  }, [])
  
  // get cities api
  useEffect(() => {
    api.get("city").then(({ data }) => {
      setCities(data)
    })
  }, [])

  // alphabetical order countries
  countries?.sort(function(a, b) {
    if (a.name_ptbr < b.name_ptbr) {
      return -1
    } else {
      return 0
    }
  })

  // alphabetical order cities
  cities?.sort(function(a, b) {
    if (a.name < b.name) {
      return -1
    } else {
      return 0
    }
  })

  // populate react-select countries
  const selectCountries = countries.map((country) => {
    return {
      value: country.name_ptbr, label: country.name_ptbr
    }
  })
  
  // populate react-select cities
  const selectCities = cities.map((city) => {
    return {
      value: city.name, 
      label: city.name_ptbr != null ? city.name_ptbr : city.name
    }
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<IFormInputs>({
    resolver: yupResolver(schema)
  });

  const name = watch("name")
  const email = watch("email")
  const phone = watch("phone")
  const cpf = watch("cpf")

  const isSubmitDisabled = 
    !name || !email || !phone || !cpf || selectedCountries.length == 0 || selectedCities.length == 0
  
  function onSubmit(userData: IFormInputs) {
    userData["countries"] = selectedCountries
    userData["cities"] = selectedCities
    setShowModalSuccess(true)
    console.log(userData)
  }

  function closeModalSuccess() {
    setShowModalSuccess(false)
    window.location.reload()
  }

  return(
    <>
      {showModalSuccess && 
        <ModalSuccess 
          closeModalSuccess={closeModalSuccess}
        />
      }
      <form 
        className={styles.formContainer}
        onSubmit={handleSubmit(onSubmit)}
      >
        <img src={Logo} alt="logo" />
        <h2>TO GO</h2>
        <div className={styles.formContent}>
          <div className={styles.formFields}>
            <label>
              <span className={styles.labelName}>Nome</span>
              <input
                className={styles.userDataInput} 
                { ...register("name", { required: true }) } />
                <span className={styles.errorMessage}></span>
            </label>
            <label>
              <span className={styles.labelName}>Email</span>
              <input
                className={styles.userDataInput} 
                { ...register("email", { required: true }) } />
              <span className={styles.errorMessage}>{errors.email?.message}</span>
            </label>
            <label>
              <span className={styles.labelName}>Telefone</span>
              <input
                className={styles.userDataInput} 
                { ...register("phone", { required: true }) } />
              <span className={styles.errorMessage}>{errors.phone?.message}</span>

            </label>
            <label>
              <span className={styles.labelName}>CPF</span>
              <input
                className={styles.userDataInput} 
                { ...register("cpf", { required: true }) } />
              <span className={styles.errorMessage}>{errors.cpf?.message}</span>
            </label>
          </div>
          <div className={styles.formFields}>
            <label>
              <span className={styles.labelName}>Países</span>
              <Select 
                className={styles.select}
                placeholder={"Escolha o(s) País(es)"}
                options={selectCountries} 
                isMulti
                onChange={(e) => setSelectedCountries(e.map(c => c.value))}
                isLoading={countries.length == 0}              
              />
            </label>
            <label>
              <span className={styles.labelName}>Cidades</span>
              <Select 
                className={styles.select}
                placeholder={"Escolha a(s) Cidade(s)"}
                options={selectCities} 
                isMulti
                onChange={(e) => setSelectedCities(e.map(c => c.value))}
                isLoading={cities.length == 0}
              />
            </label>
          </div>
        </div>
        {isSubmitDisabled && 
          <p>Preencha todos os campos para enviar o formulário.</p>
        }
        <button 
          type="submit"
          disabled={isSubmitDisabled}
        >
          Enviar
        </button>
      </form>
    </>
  )
}