import _ from 'lodash';
import components from '../components/index';

const SectionGrid = (props) => {
  const section = _.get(props, 'section', null);
  
  return(
    <div className="SectionGrid">
    {_.map(_.get(section, 'cells', null), (cell, cell_idx) => {
        let component = _.upperFirst(_.camelCase(_.get(cell, 'type', null)));
        let Component = components[component];
        return (
          <Component {...cell} key={cell_idx} />
          // <BoopComponent key={cell_idx} {...cell} />
        )
    })}
    </div>
  )
}

export default SectionGrid