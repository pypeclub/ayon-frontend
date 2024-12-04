import { ReleaseListItemModel } from '@api/rest/releases'
import { MarketListItem } from '../MarketAddonsList'
import { createReleaseSubtitle } from '@containers/ReleaseInstallerDialog/helpers'

export const transformReleasesToTable = (releases: ReleaseListItemModel[]): MarketListItem[] => {
  const releaseGroups: MarketListItem[] = []

  const sortedReleases = [...releases].sort((a, b) => b.name.localeCompare(a.name))

  // group releases by name split by '-' (first bit is the name)
  sortedReleases.forEach((release) => {
    const [name] = release.name.split('-')
    const foundGroup = releaseGroups.find((item) => item.group?.id === name)
    const releaseItem: MarketListItem['items'][0] = {
      name: release.name,
      title: release.name,
      isDownloaded: false,
      isOfficial: true,
      isVerified: true,
      isProductionOutdated: false,
      isLocked: !release.isLatest,
      subTitle: createReleaseSubtitle({ createdAt: release.createdAt }),
    }
    if (foundGroup) {
      foundGroup.items.push(releaseItem)
    } else {
      const group: MarketListItem['group'] = {
        id: name,
        title: `${name} ${release.isLatest ? ' - Latest' : ''}`,
        isOfficial: true,
        isVerified: true,
        author: 'Ynput',
        createdAt: release.createdAt,
      }
      releaseGroups.push({
        type: 'release',
        group,
        items: [releaseItem],
      })
    }
  })

  return releaseGroups
}
