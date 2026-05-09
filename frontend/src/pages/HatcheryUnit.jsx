import { useTranslation } from 'react-i18next'
import UnitPondGrid from '../components/Units/UnitPondGrid'

export default function HatcheryUnit() {
  const { t } = useTranslation()

  return (
    <UnitPondGrid 
      unitType="hatchery"
      unitTitle={t('units.hatchery')}
      systemType="نظام RAS + Biofloc"
    />
  )
}
