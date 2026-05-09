import { useTranslation } from 'react-i18next'
import UnitPondGrid from '../components/Units/UnitPondGrid'

export default function FatteningUnit() {
  const { t } = useTranslation()

  return (
    <UnitPondGrid 
      unitType="growout"
      unitTitle={t('units.fattening')}
      systemType="نظام Biofloc"
    />
  )
}
