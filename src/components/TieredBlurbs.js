import _ from 'lodash';
import { htmlToReact } from '../utils';

const TieredBlurbs = (props) => {
  return(
    <div className="TieredBlurbs">
    {_.map(_.get(props, 'blurbs', null), (blurb, blurb_idx) => {
      let Tag = blurb.type
      let styles = {}
      if (blurb.gradient) {
        styles.background = blurb.gradient
        styles.backgroundClip = 'text'
        styles.WebkitBackgroundClip = 'text'
        styles.color = 'transparent'
      }
      if (blurb.color) {
        styles.color = blurb.color
      }
      return (
        <Tag key={blurb_idx} style={styles}>{blurb.content}</Tag>
      )
    })}
    </div>
  )
}

export default TieredBlurbs