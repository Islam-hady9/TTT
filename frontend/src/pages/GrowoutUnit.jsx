import { useTranslation } from 'react-i18next'
import UnitPondGrid from '../components/Units/UnitPondGrid'

export default function GrowoutUnit() {
  const { t } = useTranslation()

  return (
    <UnitPondGrid 
      unitType="growout"
      unitTitle={t('units.growout')}
      systemType="نظام Biofloc"
    />
  )
}
