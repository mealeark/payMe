import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

import MilestoneForm from './MilestoneForm';
import MilestoneListView from './MilestoneListView';
import { setMilestones } from '../../store/actions/userActions';

export class MilestonePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMilestones: [],
    };
    this.handleMilestoneGet = this.handleMilestoneGet.bind(this);
    this.handleMilestonePost = this.handleMilestonePost.bind(this);
    this.handleMilestoneUpdate = this.handleMilestoneUpdate.bind(this);
    this.hanldeMilestoneDelete = this.hanldeMilestoneDelete.bind(this);
  }

  componentDidMount() {
    this.handleMilestoneGet((response) => {
      this.setState({currentMilestones: response})
    });
  }

  handleMilestoneGet(callback) {
    if (!this.props.session.user) {
      this.props.history.push('/login')
    } else {
      let { id } = this.props.session.user;
      axios.get(`api/milestones?user_id=${id}`)
        .then((response) => {
          callback(response.data);
        });
    }
  }

  handleMilestonePost(query, callback) {
    let milestoneInfo = Object.assign({}, query, {user_id: this.props.session.user.id})
    axios.post((`/api/milestones?user_id=${this.props.session.user.id}`), milestoneInfo)
      .then((response) => {
        this.handleMilestoneGet((data) => {
          this.setState({ currentMilestones: data });
        });
        callback();
      });
  }

  // this function updates the milestone
  handleMilestoneUpdate(query, updateState) {
    axios.patch((`/api/milestones?user_id=${query}`), updateState)
      .then((response) => {
        this.handleMilestoneGet((data) => {
          this.setState({ currentMilestones: data });
        });
      });
  }

  // this function deletes the milestone
  hanldeMilestoneDelete(milestoneID) {
    axios.delete(`/api/milestones?id=${milestoneID}`)
      .then((reponse) => {
        this.handleMilestoneGet((data) => {
          this.setState({ currentMilestones: data })
        });
      });
  }

  render() {
    const { currentMilestones } = this.state;
    if (currentMilestones === 0) {
      return (
        <div />
      );
    }
    return (
      <div>
        <div className="ui equal width three column grid">
          <div className="one wide column" />
          <div className="column">
            <div className="ui equal width grid">
              <div className="equal width row">
                <div className="column">
                  <MilestoneForm
                    milestoneUpdate={this.handleMilestonePost}
                    milestoneGet={this.handleMilestoneGet}
                  />
                </div>
                <div className="column">
                  <Fragment>
                    {currentMilestones.map(milestone => (
                      <MilestoneListView
                        key={milestone.id}
                        update={this.handleMilestoneUpdate}
                        milestone={milestone}
                        deleteMilestone={this.hanldeMilestoneDelete}
                      />
                    ))}
                  </Fragment>
                </div>
              </div>
            </div>
          </div>
          <div className="one wide column>" />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return ({ session: state.user });
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setMilestones
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MilestonePage)